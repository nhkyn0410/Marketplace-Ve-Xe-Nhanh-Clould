//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'fare_list_response_dto_output_items_inner.g.dart';

/// FareListResponseDtoOutputItemsInner
///
/// Properties:
/// * [id] 
/// * [routeId] 
/// * [routeName] 
/// * [status] 
/// * [createdAt] 
/// * [updatedAt] 
/// * [ruleCount] 
@BuiltValue()
abstract class FareListResponseDtoOutputItemsInner implements Built<FareListResponseDtoOutputItemsInner, FareListResponseDtoOutputItemsInnerBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'routeId')
  String get routeId;

  @BuiltValueField(wireName: r'routeName')
  String get routeName;

  @BuiltValueField(wireName: r'status')
  FareListResponseDtoOutputItemsInnerStatusEnum get status;
  // enum statusEnum {  ACTIVE,  INACTIVE,  };

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  @BuiltValueField(wireName: r'ruleCount')
  int get ruleCount;

  FareListResponseDtoOutputItemsInner._();

  factory FareListResponseDtoOutputItemsInner([void updates(FareListResponseDtoOutputItemsInnerBuilder b)]) = _$FareListResponseDtoOutputItemsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FareListResponseDtoOutputItemsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FareListResponseDtoOutputItemsInner> get serializer => _$FareListResponseDtoOutputItemsInnerSerializer();
}

class _$FareListResponseDtoOutputItemsInnerSerializer implements PrimitiveSerializer<FareListResponseDtoOutputItemsInner> {
  @override
  final Iterable<Type> types = const [FareListResponseDtoOutputItemsInner, _$FareListResponseDtoOutputItemsInner];

  @override
  final String wireName = r'FareListResponseDtoOutputItemsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FareListResponseDtoOutputItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'routeId';
    yield serializers.serialize(
      object.routeId,
      specifiedType: const FullType(String),
    );
    yield r'routeName';
    yield serializers.serialize(
      object.routeName,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(FareListResponseDtoOutputItemsInnerStatusEnum),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'updatedAt';
    yield serializers.serialize(
      object.updatedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'ruleCount';
    yield serializers.serialize(
      object.ruleCount,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FareListResponseDtoOutputItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FareListResponseDtoOutputItemsInnerBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'routeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.routeId = valueDes;
          break;
        case r'routeName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.routeName = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(FareListResponseDtoOutputItemsInnerStatusEnum),
          ) as FareListResponseDtoOutputItemsInnerStatusEnum;
          result.status = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'updatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.updatedAt = valueDes;
          break;
        case r'ruleCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.ruleCount = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FareListResponseDtoOutputItemsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FareListResponseDtoOutputItemsInnerBuilder();
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


class FareListResponseDtoOutputItemsInnerStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const FareListResponseDtoOutputItemsInnerStatusEnum ACTIVE = _$fareListResponseDtoOutputItemsInnerStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const FareListResponseDtoOutputItemsInnerStatusEnum INACTIVE = _$fareListResponseDtoOutputItemsInnerStatusEnum_INACTIVE;

  static Serializer<FareListResponseDtoOutputItemsInnerStatusEnum> get serializer => _$fareListResponseDtoOutputItemsInnerStatusEnumSerializer;

  const FareListResponseDtoOutputItemsInnerStatusEnum._(String name): super(name);

  static BuiltSet<FareListResponseDtoOutputItemsInnerStatusEnum> get values => _$fareListResponseDtoOutputItemsInnerStatusEnumValues;
  static FareListResponseDtoOutputItemsInnerStatusEnum valueOf(String name) => _$fareListResponseDtoOutputItemsInnerStatusEnumValueOf(name);
}

