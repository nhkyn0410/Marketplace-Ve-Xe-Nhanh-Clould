//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/fare_response_dto_output_rules_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'fare_revision_list_response_dto_output_items_inner_before.g.dart';

/// FareRevisionListResponseDtoOutputItemsInnerBefore
///
/// Properties:
/// * [routeId] 
/// * [status] 
/// * [note] 
/// * [rules] 
@BuiltValue()
abstract class FareRevisionListResponseDtoOutputItemsInnerBefore implements Built<FareRevisionListResponseDtoOutputItemsInnerBefore, FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder> {
  @BuiltValueField(wireName: r'routeId')
  String get routeId;

  @BuiltValueField(wireName: r'status')
  FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum get status;
  // enum statusEnum {  ACTIVE,  INACTIVE,  };

  @BuiltValueField(wireName: r'note')
  String? get note;

  @BuiltValueField(wireName: r'rules')
  BuiltList<FareResponseDtoOutputRulesInner> get rules;

  FareRevisionListResponseDtoOutputItemsInnerBefore._();

  factory FareRevisionListResponseDtoOutputItemsInnerBefore([void updates(FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder b)]) = _$FareRevisionListResponseDtoOutputItemsInnerBefore;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FareRevisionListResponseDtoOutputItemsInnerBefore> get serializer => _$FareRevisionListResponseDtoOutputItemsInnerBeforeSerializer();
}

class _$FareRevisionListResponseDtoOutputItemsInnerBeforeSerializer implements PrimitiveSerializer<FareRevisionListResponseDtoOutputItemsInnerBefore> {
  @override
  final Iterable<Type> types = const [FareRevisionListResponseDtoOutputItemsInnerBefore, _$FareRevisionListResponseDtoOutputItemsInnerBefore];

  @override
  final String wireName = r'FareRevisionListResponseDtoOutputItemsInnerBefore';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FareRevisionListResponseDtoOutputItemsInnerBefore object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'routeId';
    yield serializers.serialize(
      object.routeId,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum),
    );
    yield r'note';
    yield object.note == null ? null : serializers.serialize(
      object.note,
      specifiedType: const FullType.nullable(String),
    );
    yield r'rules';
    yield serializers.serialize(
      object.rules,
      specifiedType: const FullType(BuiltList, [FullType(FareResponseDtoOutputRulesInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FareRevisionListResponseDtoOutputItemsInnerBefore object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'routeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.routeId = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum),
          ) as FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum;
          result.status = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.note = valueDes;
          break;
        case r'rules':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(FareResponseDtoOutputRulesInner)]),
          ) as BuiltList<FareResponseDtoOutputRulesInner>;
          result.rules.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FareRevisionListResponseDtoOutputItemsInnerBefore deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder();
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


class FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum ACTIVE = _$fareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum INACTIVE = _$fareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum_INACTIVE;

  static Serializer<FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum> get serializer => _$fareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnumSerializer;

  const FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum._(String name): super(name);

  static BuiltSet<FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum> get values => _$fareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnumValues;
  static FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum valueOf(String name) => _$fareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnumValueOf(name);
}

