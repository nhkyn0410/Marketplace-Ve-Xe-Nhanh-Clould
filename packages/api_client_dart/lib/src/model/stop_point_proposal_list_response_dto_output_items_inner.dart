//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'stop_point_proposal_list_response_dto_output_items_inner.g.dart';

/// StopPointProposalListResponseDtoOutputItemsInner
///
/// Properties:
/// * [id] 
/// * [name] 
/// * [type] 
/// * [address] 
/// * [provinceId] 
/// * [wardId] 
/// * [latitude] 
/// * [longitude] 
/// * [description] 
/// * [createdAt] 
/// * [updatedAt] 
/// * [status] 
/// * [rejectionReason] 
/// * [catalogStopPointId] 
@BuiltValue()
abstract class StopPointProposalListResponseDtoOutputItemsInner implements Built<StopPointProposalListResponseDtoOutputItemsInner, StopPointProposalListResponseDtoOutputItemsInnerBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'type')
  StopPointProposalListResponseDtoOutputItemsInnerTypeEnum get type;
  // enum typeEnum {  BUS_STATION,  OFFICE,  REST_STOP,  PICKUP_POINT,  };

  @BuiltValueField(wireName: r'address')
  String get address;

  @BuiltValueField(wireName: r'provinceId')
  String get provinceId;

  @BuiltValueField(wireName: r'wardId')
  String get wardId;

  @BuiltValueField(wireName: r'latitude')
  num get latitude;

  @BuiltValueField(wireName: r'longitude')
  num get longitude;

  @BuiltValueField(wireName: r'description')
  String? get description;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  @BuiltValueField(wireName: r'status')
  StopPointProposalListResponseDtoOutputItemsInnerStatusEnum get status;
  // enum statusEnum {  PENDING,  APPROVED,  REJECTED,  };

  @BuiltValueField(wireName: r'rejectionReason')
  String? get rejectionReason;

  @BuiltValueField(wireName: r'catalogStopPointId')
  String? get catalogStopPointId;

  StopPointProposalListResponseDtoOutputItemsInner._();

  factory StopPointProposalListResponseDtoOutputItemsInner([void updates(StopPointProposalListResponseDtoOutputItemsInnerBuilder b)]) = _$StopPointProposalListResponseDtoOutputItemsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(StopPointProposalListResponseDtoOutputItemsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<StopPointProposalListResponseDtoOutputItemsInner> get serializer => _$StopPointProposalListResponseDtoOutputItemsInnerSerializer();
}

class _$StopPointProposalListResponseDtoOutputItemsInnerSerializer implements PrimitiveSerializer<StopPointProposalListResponseDtoOutputItemsInner> {
  @override
  final Iterable<Type> types = const [StopPointProposalListResponseDtoOutputItemsInner, _$StopPointProposalListResponseDtoOutputItemsInner];

  @override
  final String wireName = r'StopPointProposalListResponseDtoOutputItemsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    StopPointProposalListResponseDtoOutputItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'type';
    yield serializers.serialize(
      object.type,
      specifiedType: const FullType(StopPointProposalListResponseDtoOutputItemsInnerTypeEnum),
    );
    yield r'address';
    yield serializers.serialize(
      object.address,
      specifiedType: const FullType(String),
    );
    yield r'provinceId';
    yield serializers.serialize(
      object.provinceId,
      specifiedType: const FullType(String),
    );
    yield r'wardId';
    yield serializers.serialize(
      object.wardId,
      specifiedType: const FullType(String),
    );
    yield r'latitude';
    yield serializers.serialize(
      object.latitude,
      specifiedType: const FullType(num),
    );
    yield r'longitude';
    yield serializers.serialize(
      object.longitude,
      specifiedType: const FullType(num),
    );
    yield r'description';
    yield object.description == null ? null : serializers.serialize(
      object.description,
      specifiedType: const FullType.nullable(String),
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
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(StopPointProposalListResponseDtoOutputItemsInnerStatusEnum),
    );
    yield r'rejectionReason';
    yield object.rejectionReason == null ? null : serializers.serialize(
      object.rejectionReason,
      specifiedType: const FullType.nullable(String),
    );
    yield r'catalogStopPointId';
    yield object.catalogStopPointId == null ? null : serializers.serialize(
      object.catalogStopPointId,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    StopPointProposalListResponseDtoOutputItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required StopPointProposalListResponseDtoOutputItemsInnerBuilder result,
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
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'type':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(StopPointProposalListResponseDtoOutputItemsInnerTypeEnum),
          ) as StopPointProposalListResponseDtoOutputItemsInnerTypeEnum;
          result.type = valueDes;
          break;
        case r'address':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.address = valueDes;
          break;
        case r'provinceId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.provinceId = valueDes;
          break;
        case r'wardId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.wardId = valueDes;
          break;
        case r'latitude':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(num),
          ) as num;
          result.latitude = valueDes;
          break;
        case r'longitude':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(num),
          ) as num;
          result.longitude = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.description = valueDes;
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
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(StopPointProposalListResponseDtoOutputItemsInnerStatusEnum),
          ) as StopPointProposalListResponseDtoOutputItemsInnerStatusEnum;
          result.status = valueDes;
          break;
        case r'rejectionReason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.rejectionReason = valueDes;
          break;
        case r'catalogStopPointId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.catalogStopPointId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  StopPointProposalListResponseDtoOutputItemsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = StopPointProposalListResponseDtoOutputItemsInnerBuilder();
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


class StopPointProposalListResponseDtoOutputItemsInnerTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'BUS_STATION')
  static const StopPointProposalListResponseDtoOutputItemsInnerTypeEnum BUS_STATION = _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_BUS_STATION;
  @BuiltValueEnumConst(wireName: r'OFFICE')
  static const StopPointProposalListResponseDtoOutputItemsInnerTypeEnum OFFICE = _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_OFFICE;
  @BuiltValueEnumConst(wireName: r'REST_STOP')
  static const StopPointProposalListResponseDtoOutputItemsInnerTypeEnum REST_STOP = _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_REST_STOP;
  @BuiltValueEnumConst(wireName: r'PICKUP_POINT')
  static const StopPointProposalListResponseDtoOutputItemsInnerTypeEnum PICKUP_POINT = _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnum_PICKUP_POINT;

  static Serializer<StopPointProposalListResponseDtoOutputItemsInnerTypeEnum> get serializer => _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnumSerializer;

  const StopPointProposalListResponseDtoOutputItemsInnerTypeEnum._(String name): super(name);

  static BuiltSet<StopPointProposalListResponseDtoOutputItemsInnerTypeEnum> get values => _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnumValues;
  static StopPointProposalListResponseDtoOutputItemsInnerTypeEnum valueOf(String name) => _$stopPointProposalListResponseDtoOutputItemsInnerTypeEnumValueOf(name);
}

class StopPointProposalListResponseDtoOutputItemsInnerStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const StopPointProposalListResponseDtoOutputItemsInnerStatusEnum PENDING = _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const StopPointProposalListResponseDtoOutputItemsInnerStatusEnum APPROVED = _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnum_APPROVED;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const StopPointProposalListResponseDtoOutputItemsInnerStatusEnum REJECTED = _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnum_REJECTED;

  static Serializer<StopPointProposalListResponseDtoOutputItemsInnerStatusEnum> get serializer => _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnumSerializer;

  const StopPointProposalListResponseDtoOutputItemsInnerStatusEnum._(String name): super(name);

  static BuiltSet<StopPointProposalListResponseDtoOutputItemsInnerStatusEnum> get values => _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnumValues;
  static StopPointProposalListResponseDtoOutputItemsInnerStatusEnum valueOf(String name) => _$stopPointProposalListResponseDtoOutputItemsInnerStatusEnumValueOf(name);
}

