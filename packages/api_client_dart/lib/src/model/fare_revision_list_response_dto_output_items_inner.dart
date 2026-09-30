//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/fare_revision_list_response_dto_output_items_inner_after.dart';
import 'package:api_client_dart/src/model/fare_revision_list_response_dto_output_items_inner_before.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'fare_revision_list_response_dto_output_items_inner.g.dart';

/// FareRevisionListResponseDtoOutputItemsInner
///
/// Properties:
/// * [action] 
/// * [actorId] 
/// * [createdAt] 
/// * [before] 
/// * [after] 
@BuiltValue()
abstract class FareRevisionListResponseDtoOutputItemsInner implements Built<FareRevisionListResponseDtoOutputItemsInner, FareRevisionListResponseDtoOutputItemsInnerBuilder> {
  @BuiltValueField(wireName: r'action')
  FareRevisionListResponseDtoOutputItemsInnerActionEnum get action;
  // enum actionEnum {  fare.create,  fare.update,  };

  @BuiltValueField(wireName: r'actorId')
  String? get actorId;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'before')
  FareRevisionListResponseDtoOutputItemsInnerBefore? get before;

  @BuiltValueField(wireName: r'after')
  FareRevisionListResponseDtoOutputItemsInnerAfter get after;

  FareRevisionListResponseDtoOutputItemsInner._();

  factory FareRevisionListResponseDtoOutputItemsInner([void updates(FareRevisionListResponseDtoOutputItemsInnerBuilder b)]) = _$FareRevisionListResponseDtoOutputItemsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FareRevisionListResponseDtoOutputItemsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FareRevisionListResponseDtoOutputItemsInner> get serializer => _$FareRevisionListResponseDtoOutputItemsInnerSerializer();
}

class _$FareRevisionListResponseDtoOutputItemsInnerSerializer implements PrimitiveSerializer<FareRevisionListResponseDtoOutputItemsInner> {
  @override
  final Iterable<Type> types = const [FareRevisionListResponseDtoOutputItemsInner, _$FareRevisionListResponseDtoOutputItemsInner];

  @override
  final String wireName = r'FareRevisionListResponseDtoOutputItemsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FareRevisionListResponseDtoOutputItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'action';
    yield serializers.serialize(
      object.action,
      specifiedType: const FullType(FareRevisionListResponseDtoOutputItemsInnerActionEnum),
    );
    yield r'actorId';
    yield object.actorId == null ? null : serializers.serialize(
      object.actorId,
      specifiedType: const FullType.nullable(String),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'before';
    yield object.before == null ? null : serializers.serialize(
      object.before,
      specifiedType: const FullType.nullable(FareRevisionListResponseDtoOutputItemsInnerBefore),
    );
    yield r'after';
    yield serializers.serialize(
      object.after,
      specifiedType: const FullType(FareRevisionListResponseDtoOutputItemsInnerAfter),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FareRevisionListResponseDtoOutputItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FareRevisionListResponseDtoOutputItemsInnerBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'action':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(FareRevisionListResponseDtoOutputItemsInnerActionEnum),
          ) as FareRevisionListResponseDtoOutputItemsInnerActionEnum;
          result.action = valueDes;
          break;
        case r'actorId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.actorId = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'before':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(FareRevisionListResponseDtoOutputItemsInnerBefore),
          ) as FareRevisionListResponseDtoOutputItemsInnerBefore?;
          if (valueDes == null) continue;
          result.before.replace(valueDes);
          break;
        case r'after':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(FareRevisionListResponseDtoOutputItemsInnerAfter),
          ) as FareRevisionListResponseDtoOutputItemsInnerAfter;
          result.after.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FareRevisionListResponseDtoOutputItemsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FareRevisionListResponseDtoOutputItemsInnerBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}


class FareRevisionListResponseDtoOutputItemsInnerActionEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'fare.create')
  static const FareRevisionListResponseDtoOutputItemsInnerActionEnum farePeriodCreate = _$fareRevisionListResponseDtoOutputItemsInnerActionEnum_farePeriodCreate;
  @BuiltValueEnumConst(wireName: r'fare.update')
  static const FareRevisionListResponseDtoOutputItemsInnerActionEnum farePeriodUpdate = _$fareRevisionListResponseDtoOutputItemsInnerActionEnum_farePeriodUpdate;

  static Serializer<FareRevisionListResponseDtoOutputItemsInnerActionEnum> get serializer => _$fareRevisionListResponseDtoOutputItemsInnerActionEnumSerializer;

  const FareRevisionListResponseDtoOutputItemsInnerActionEnum._(String name): super(name);

  static BuiltSet<FareRevisionListResponseDtoOutputItemsInnerActionEnum> get values => _$fareRevisionListResponseDtoOutputItemsInnerActionEnumValues;
  static FareRevisionListResponseDtoOutputItemsInnerActionEnum valueOf(String name) => _$fareRevisionListResponseDtoOutputItemsInnerActionEnumValueOf(name);
}

