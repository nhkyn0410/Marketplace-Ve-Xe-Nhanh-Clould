//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'route_list_response_dto_output_items_inner.g.dart';

/// RouteListResponseDtoOutputItemsInner
///
/// Properties:
/// * [id] 
/// * [name] 
/// * [status] 
/// * [totalDistanceMeters] 
/// * [totalDurationSeconds] 
/// * [metricsSource] 
/// * [createdAt] 
/// * [updatedAt] 
/// * [stopCount] 
@BuiltValue()
abstract class RouteListResponseDtoOutputItemsInner implements Built<RouteListResponseDtoOutputItemsInner, RouteListResponseDtoOutputItemsInnerBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'status')
  RouteListResponseDtoOutputItemsInnerStatusEnum get status;
  // enum statusEnum {  ACTIVE,  INACTIVE,  };

  @BuiltValueField(wireName: r'totalDistanceMeters')
  int get totalDistanceMeters;

  @BuiltValueField(wireName: r'totalDurationSeconds')
  int get totalDurationSeconds;

  @BuiltValueField(wireName: r'metricsSource')
  RouteListResponseDtoOutputItemsInnerMetricsSourceEnum get metricsSource;
  // enum metricsSourceEnum {  GOONG,  ESTIMATE,  };

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  @BuiltValueField(wireName: r'stopCount')
  int get stopCount;

  RouteListResponseDtoOutputItemsInner._();

  factory RouteListResponseDtoOutputItemsInner([void updates(RouteListResponseDtoOutputItemsInnerBuilder b)]) = _$RouteListResponseDtoOutputItemsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RouteListResponseDtoOutputItemsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RouteListResponseDtoOutputItemsInner> get serializer => _$RouteListResponseDtoOutputItemsInnerSerializer();
}

class _$RouteListResponseDtoOutputItemsInnerSerializer implements PrimitiveSerializer<RouteListResponseDtoOutputItemsInner> {
  @override
  final Iterable<Type> types = const [RouteListResponseDtoOutputItemsInner, _$RouteListResponseDtoOutputItemsInner];

  @override
  final String wireName = r'RouteListResponseDtoOutputItemsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RouteListResponseDtoOutputItemsInner object, {
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
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(RouteListResponseDtoOutputItemsInnerStatusEnum),
    );
    yield r'totalDistanceMeters';
    yield serializers.serialize(
      object.totalDistanceMeters,
      specifiedType: const FullType(int),
    );
    yield r'totalDurationSeconds';
    yield serializers.serialize(
      object.totalDurationSeconds,
      specifiedType: const FullType(int),
    );
    yield r'metricsSource';
    yield serializers.serialize(
      object.metricsSource,
      specifiedType: const FullType(RouteListResponseDtoOutputItemsInnerMetricsSourceEnum),
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
    yield r'stopCount';
    yield serializers.serialize(
      object.stopCount,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RouteListResponseDtoOutputItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RouteListResponseDtoOutputItemsInnerBuilder result,
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
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RouteListResponseDtoOutputItemsInnerStatusEnum),
          ) as RouteListResponseDtoOutputItemsInnerStatusEnum;
          result.status = valueDes;
          break;
        case r'totalDistanceMeters':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.totalDistanceMeters = valueDes;
          break;
        case r'totalDurationSeconds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.totalDurationSeconds = valueDes;
          break;
        case r'metricsSource':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RouteListResponseDtoOutputItemsInnerMetricsSourceEnum),
          ) as RouteListResponseDtoOutputItemsInnerMetricsSourceEnum;
          result.metricsSource = valueDes;
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
        case r'stopCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.stopCount = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RouteListResponseDtoOutputItemsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RouteListResponseDtoOutputItemsInnerBuilder();
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


class RouteListResponseDtoOutputItemsInnerStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const RouteListResponseDtoOutputItemsInnerStatusEnum ACTIVE = _$routeListResponseDtoOutputItemsInnerStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const RouteListResponseDtoOutputItemsInnerStatusEnum INACTIVE = _$routeListResponseDtoOutputItemsInnerStatusEnum_INACTIVE;

  static Serializer<RouteListResponseDtoOutputItemsInnerStatusEnum> get serializer => _$routeListResponseDtoOutputItemsInnerStatusEnumSerializer;

  const RouteListResponseDtoOutputItemsInnerStatusEnum._(String name): super(name);

  static BuiltSet<RouteListResponseDtoOutputItemsInnerStatusEnum> get values => _$routeListResponseDtoOutputItemsInnerStatusEnumValues;
  static RouteListResponseDtoOutputItemsInnerStatusEnum valueOf(String name) => _$routeListResponseDtoOutputItemsInnerStatusEnumValueOf(name);
}

class RouteListResponseDtoOutputItemsInnerMetricsSourceEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'GOONG')
  static const RouteListResponseDtoOutputItemsInnerMetricsSourceEnum GOONG = _$routeListResponseDtoOutputItemsInnerMetricsSourceEnum_GOONG;
  @BuiltValueEnumConst(wireName: r'ESTIMATE')
  static const RouteListResponseDtoOutputItemsInnerMetricsSourceEnum ESTIMATE = _$routeListResponseDtoOutputItemsInnerMetricsSourceEnum_ESTIMATE;

  static Serializer<RouteListResponseDtoOutputItemsInnerMetricsSourceEnum> get serializer => _$routeListResponseDtoOutputItemsInnerMetricsSourceEnumSerializer;

  const RouteListResponseDtoOutputItemsInnerMetricsSourceEnum._(String name): super(name);

  static BuiltSet<RouteListResponseDtoOutputItemsInnerMetricsSourceEnum> get values => _$routeListResponseDtoOutputItemsInnerMetricsSourceEnumValues;
  static RouteListResponseDtoOutputItemsInnerMetricsSourceEnum valueOf(String name) => _$routeListResponseDtoOutputItemsInnerMetricsSourceEnumValueOf(name);
}

